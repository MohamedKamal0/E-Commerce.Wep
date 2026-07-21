using Microsoft.AspNetCore.Mvc;
using ServiceLayerAbstraction;
using SheredLayer;
using SheredLayer.DTOs;

namespace PresentationLayer.Controllers
{
    public class ProductController(IServiceManger _serviceManger) : ApiBasController
    {

        [HttpGet]
        public async Task<ActionResult<PaginatedResult<ProductDto>>> GetAllProducts([FromQuery] productQueryParams queryParams)
        {
            var products = await _serviceManger.productService.GetAllProductsAsync(queryParams);
            return Ok(products);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProductById(int id)
        {
            var product = await _serviceManger.productService.GetProductByIdAsync(id);
            //if (product == null)
            //   return NotFound();
            return Ok(product);
        }
        [HttpGet("brands")]

        public async Task<ActionResult<IEnumerable<BrandDto>>> GetAllBrands([FromQuery] BrandQueryParams queryParams)
        {

            var brands = await _serviceManger.productService.GetAllBrandAsync(queryParams);
            return Ok(brands);
        }
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<TyepDto>>> GetAllTypes()
        {
            var types = await _serviceManger.productService.GetAllTyepAsync();
            return Ok(types);
        }
    }
}