using Microsoft.AspNetCore.Mvc;
using ServiceLayerAbstraction;
using SheredLayer.DTOs;

namespace PresentationLayer.Controllers
{

    public class PaymentController(IServiceManger _serviceManger) : ApiBasController
    {
        [HttpPost("{BasketId}")]
        public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent(string BasketId)
        {
            var Basket = await _serviceManger.paymentService.CreateOrUpdatePayment(BasketId);
            return Ok(Basket);
        }
    }
}
