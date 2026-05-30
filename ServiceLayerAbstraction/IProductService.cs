using SheredLayer;
using SheredLayer.DTOs;

namespace ServiceLayerAbstraction
{
    public interface IProductService
    {
        Task<PaginatedResult<ProductDto>> GetAllProductsAsync(productQueryParams queryParams);
        Task<ProductDto?> GetProductByIdAsync(int id);

        Task<PaginatedResult<BrandDto>> GetAllBrandAsync(BrandQueryParams queryParams);
        Task<IEnumerable<TyepDto>> GetAllTyepAsync();

    }
}
