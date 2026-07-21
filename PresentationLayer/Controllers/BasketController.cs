using Microsoft.AspNetCore.Mvc;
using ServiceLayerAbstraction;
using SheredLayer.DTOs;

namespace PresentationLayer.Controllers
{
    public class BasketController(IServiceManger _serviceManger) : ApiBasController
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<BasketDto>> GetBasketById(string id)
        {
            var basket = await _serviceManger.basketService.GetBasketAsync(id);
            return Ok(basket);
        }
        [HttpPost]
        public async Task<ActionResult<BasketDto>> CreateOrUpdateBasket(BasketDto basket)
        {
            var updatedBasket = await _serviceManger.basketService.CreateOrUpdateBasket(basket);
            return Ok(updatedBasket);
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteBasket(string id)
        {
            var result = await _serviceManger.basketService.DeleteBasketAsync(id);
            return Ok(result);
        }

    }
}
