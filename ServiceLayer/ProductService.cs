using System.Text.Json;
using AutoMapper;
using DomainLayre.Contracts;
using DomainLayre.Exceptions;
using DomainLayre.Models;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using ServiceLayer.Specifications;
using ServiceLayerAbstraction;
using SheredLayer;
using SheredLayer.DTOs;
namespace ServiceLayer
{
    public class ProductService(
        IUnitOfWorke _unitOfWorke,
        IMapper _mapper,
        IDistributedCache _cache,
        ILogger<ProductService> _logger) : IProductService
    {
        private const string ProductsVersionKey = "products:version";
        private const string ProductCacheKeyPrefix = "product:";

        private static readonly DistributedCacheEntryOptions ListCacheOptions = new DistributedCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(10));

        private static readonly DistributedCacheEntryOptions SingleItemCacheOptions = new DistributedCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
            .SetSlidingExpiration(TimeSpan.FromMinutes(5));

        // ============ Helpers الخاصة بالـ Versioning ============

        private async Task<long> GetProductsVersionAsync(CancellationToken cancellationToken)
        {
            var bytes = await _cache.GetAsync(ProductsVersionKey, cancellationToken);
            return bytes is null || bytes.Length == 0 ? 0 : BitConverter.ToInt64(bytes);
        }

        private async Task BumpProductsVersionAsync(CancellationToken cancellationToken)
        {
            var next = await GetProductsVersionAsync(cancellationToken) + 1;
            await _cache.SetAsync(ProductsVersionKey, BitConverter.GetBytes(next), cancellationToken);
        }

        private static string BuildProductsListCacheKey(productQueryParams queryParams, long version)
        {
            // بنسلسل الـ queryParams نفسها عشان كل تركيبة فلترة/صفحات تاخد مفتاح مختلف
            var paramsJson = JsonSerializer.Serialize(queryParams);
            return $"products:list:v3:{version}:{paramsJson}";
        }

        // ============ Brands & Types (زي ما هي، ممكن تكاشها بنفس الفكرة لو عايز) ============

        public async Task<PaginatedResult<BrandDto>> GetAllBrandAsync(BrandQueryParams queryParams)
        {
            var repo = _unitOfWorke.GetRepository<Product_Brand, int>();
            var specifications = new BrandSpecification(queryParams);
            var brands = await repo.GetAllAsync(specifications);
            var Data = _mapper.Map<IEnumerable<Product_Brand>, IEnumerable<BrandDto>>(brands);
            var Countpec = new BrandCountSpecification(queryParams);
            var TotalCount = await repo.CountAsync(Countpec);
            return new PaginatedResult<BrandDto>(queryParams.PageIndex, queryParams.PageSize, TotalCount, Data);
        }

        public async Task<IEnumerable<TyepDto>> GetAllTyepAsync()
        {
            var types = await _unitOfWorke.GetRepository<Product_Type, int>().GetAllAsync();
            return _mapper.Map<IEnumerable<Product_Type>, IEnumerable<TyepDto>>(types);
        }

        // ============ Products (هنا الكاشينج الفعلي) ============

        public async Task<PaginatedResult<ProductDto>> GetAllProductsAsync(
            productQueryParams queryParams,
            CancellationToken cancellationToken = default)
        {
            var version = await GetProductsVersionAsync(cancellationToken);
            var cacheKey = BuildProductsListCacheKey(queryParams, version);

            _logger.LogInformation("Fetching data for key: {CacheKey}.", cacheKey);

            var result = await _cache.GetOrSetAsync(
                cacheKey,
                async () =>
                {
                    _logger.LogInformation("Cache miss for key: {CacheKey}. Fetching from database.", cacheKey);

                    var repo = _unitOfWorke.GetRepository<Product, int>();
                    var specifications = new ProductWithprandAndTyepSpecification(queryParams);
                    var products = await repo.GetAllAsync(specifications);
                    var data = _mapper.Map<IEnumerable<Product>, IEnumerable<ProductDto>>(products);

                    var countSpec = new ProductCountSpecification(queryParams);
                    var totalCount = await repo.CountAsync(countSpec);

                    return new PaginatedResult<ProductDto>(queryParams.PageIndex, queryParams.PageSize, totalCount, data);
                },
                ListCacheOptions,
                cancellationToken);

            return result!;
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"{ProductCacheKeyPrefix}{id}";
            _logger.LogInformation("Fetching data for key: {CacheKey}.", cacheKey);

            return await _cache.GetOrSetAsync(
                cacheKey,
                async () =>
                {
                    _logger.LogInformation("Cache miss for key: {CacheKey}. Fetching from database.", cacheKey);

                    var specifications = new ProductWithprandAndTyepSpecification(id);
                    var product = await _unitOfWorke.GetRepository<Product, int>().GetByIdAsync(specifications);
                    if (product is null)
                        throw new ProuductNotFoundException(id);

                    return _mapper.Map<Product?, ProductDto?>(product);
                },
                SingleItemCacheOptions,
                cancellationToken);
        }

        public async Task<ProductDto> CreateProductAsync(
            ProductCreateDto productDto,
            CancellationToken cancellationToken = default)
        {
            if (productDto.PictureUrls is null || productDto.PictureUrls.Count == 0)
                throw new BadRequestException(["At least one product image is required"]);

            var brand = await _unitOfWorke.GetRepository<Product_Brand, int>().GetByIdAsync(productDto.BrandId);
            if (brand is null)
                throw new BadRequestException([$"Brand with id {productDto.BrandId} was not found"]);

            var type = await _unitOfWorke.GetRepository<Product_Type, int>().GetByIdAsync(productDto.TyepId);
            if (type is null)
                throw new BadRequestException([$"Type with id {productDto.TyepId} was not found"]);

            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                Color = ProductColorPalette.Resolve(productDto.Color, productDto.Name, productDto.Description),
                CreatedAt = DateTime.UtcNow,
                BrandId = productDto.BrandId,
                TyepId = productDto.TyepId,
                Images = productDto.PictureUrls
                    .Select((url, index) => new ProductImage
                    {
                        PictureUrl = url,
                        DisplayOrder = index
                    })
                    .ToList()
            };

            await _unitOfWorke.GetRepository<Product, int>().AddAsync(product);
            await _unitOfWorke.SaveChangesAsync();

            _logger.LogInformation("Invalidating products list cache (bumping version).");
            await BumpProductsVersionAsync(cancellationToken);

            return (await GetProductByIdAsync(product.Id, cancellationToken))!;
        }
    }
}