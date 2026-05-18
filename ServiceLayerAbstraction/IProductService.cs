using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SheredLayer.DTOs;

namespace ServiceLayerAbstraction
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllProductsAsync();
        Task<ProductDto?> GetProductByIdAsync(int id);

        Task<IEnumerable<BrandDto>> GetAllBrandAsync();
        Task<IEnumerable<TyepDto>> GetAllTyepAsync();

    }
}
