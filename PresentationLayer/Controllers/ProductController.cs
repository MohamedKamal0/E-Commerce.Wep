using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using PresentationLayer.Helpers;
using ServiceLayerAbstraction;
using SheredLayer;
using SheredLayer.DTOs;

namespace PresentationLayer.Controllers
{
    public class ProductController(IServiceManger _serviceManger, IWebHostEnvironment _env) : ApiBasController
    {

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,SuperAdmin")]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ProductDto>> CreateProduct([FromForm] ProductCreateDto productDto)
        {
            productDto.PictureUrls = await ProductImageUploader.SaveManyAsync(productDto.Images, _env.WebRootPath);
            var product = await _serviceManger.productService.CreateProductAsync(productDto);
            return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
        }

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