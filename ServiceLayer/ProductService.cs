using AutoMapper;
using DomainLayre.Contracts;
using DomainLayre.Exceptions;
using DomainLayre.Models;
using ServiceLayer.Specifications;
using ServiceLayerAbstraction;
using SheredLayer;
using SheredLayer.DTOs;

namespace ServiceLayer
{
    public class ProductService(IUnitOfWorke _unitOfWorke, IMapper _mapper) : IProductService
    {
        public async Task<PaginatedResult<BrandDto>> GetAllBrandAsync(BrandQueryParams queryParams)
        {

            var repo = _unitOfWorke.GetRepository<Product_Brand, int>();
            var specifications = new BrandSpecification(queryParams);
            var brands = await repo.GetAllAsync(specifications);
            var Data = _mapper.Map<IEnumerable<Product_Brand>, IEnumerable<BrandDto>>(brands);
            var brandCount = brands.Count();
            var Countpec = new BrandCountSpecification(queryParams);
            var TotalCount = await repo.CountAsync(Countpec);
            return new PaginatedResult<BrandDto>(queryParams.PageIndex, brandCount, TotalCount, Data);

        }

        public async Task<PaginatedResult<ProductDto>> GetAllProductsAsync(productQueryParams queryParams)
        {
            var repo = _unitOfWorke.GetRepository<Product, int>();
            var specifications = new ProductWithprandAndTyepSpecification(queryParams);
            var products = await repo.GetAllAsync(specifications);
            var Data = _mapper.Map<IEnumerable<Product>, IEnumerable<ProductDto>>(products);
            var ProductCount = products.Count();
            var CountSpec = new ProductCountSpecification(queryParams);
            var TotalCount = await repo.CountAsync(CountSpec);
            return new PaginatedResult<ProductDto>(queryParams.PageIndex, ProductCount, TotalCount, Data);
        }

        public async Task<IEnumerable<TyepDto>> GetAllTyepAsync()
        {

            var types = await _unitOfWorke.GetRepository<Product_Type, int>().GetAllAsync();

            return _mapper.Map<IEnumerable<Product_Type>, IEnumerable<TyepDto>>(types);
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var specifications = new ProductWithprandAndTyepSpecification(id);
            var product = await _unitOfWorke.GetRepository<Product, int>().GetByIdAsync(specifications);
            if (product == null)
                throw new ProuductNotFoundException(id);

            return _mapper.Map<Product?, ProductDto?>(product);

        }

        public async Task<ProductDto> CreateProductAsync(ProductCreateDto productDto)
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

            return (await GetProductByIdAsync(product.Id))!;
        }
    }
}
