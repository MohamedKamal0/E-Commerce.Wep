using SheredLayer;
using SheredLayer.DTOs;

namespace ServiceLayerAbstraction
{
    public interface IProductService
    {
        Task<PaginatedResult<ProductDto>> GetAllProductsAsync(productQueryParams queryParams);
        Task<ProductDto?> GetProductByIdAsync(int id);

        Task<IEnumerable<BrandDto>> GetAllBrandAsync();
        Task<IEnumerable<TyepDto>> GetAllTyepAsync();

    }
}
