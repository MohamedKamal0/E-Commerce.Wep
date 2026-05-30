using AutoMapper;
using DomainLayre.Contracts;
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

            return _mapper.Map<Product?, ProductDto?>(product);

        }
    }
}
