using SheredLayer;
using SheredLayer.DTOs;

namespace ServiceLayerAbstraction
{
    public interface IProductService
    {
        Task<PaginatedResult<ProductDto>> GetAllProductsAsync(productQueryParams queryParams, CancellationToken cancellationToken = default);
        Task<ProductDto?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default);

        Task<PaginatedResult<BrandDto>> GetAllBrandAsync(BrandQueryParams queryParams);
        Task<IEnumerable<TyepDto>> GetAllTyepAsync();

        Task<ProductDto> CreateProductAsync(ProductCreateDto productDto, CancellationToken cancellationToken = default);

    }
}
