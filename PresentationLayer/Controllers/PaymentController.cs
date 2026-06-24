using Microsoft.AspNetCore.Mvc;
using ServiceLayerAbstraction;
using SheredLayer.DTOs;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class PaymentController(IServiceManger _serviceManger) : ControllerBase
    {
        [HttpPost("{BasketId}")]
        public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent(string BasketId)
        {
            var Basket = await _serviceManger.paymentService.CreateOrUpdatePayment(BasketId);
            return Ok(Basket);
        }
    }
}
