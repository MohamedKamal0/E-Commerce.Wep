using Microsoft.AspNetCore.Mvc;
using ServiceLayerAbstraction;
using SheredLayer.DTOs;

namespace PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController(IServiceManger _serviceManger) : ControllerBase
    {
        [HttpPost("CreateOrder")]
        public async Task<ActionResult<OrderToReturn>> CreateOrder(OrderDto orderDto)
        {
            var order = await _serviceManger.orderService.CreateOrder(orderDto, "fkkf");
            return Ok(order);
        }
        [HttpGet("GetAllDeliverymethod")]
        public async Task<ActionResult<IEnumerable<DeliveryMethodDto>>> GetDeliveryMethod()
        {
            var delivery = await _serviceManger.orderService.GetDeliveryMethod();
            return Ok(delivery);
        }
        [HttpGet("GetAllOrders")]
        public async Task<ActionResult<IEnumerable<OrderToReturn>>> GetAllOrders()
        {
            var orders = await _serviceManger.orderService.GetAllOrders("fkkf");
            return Ok(orders);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderToReturn>> GetOrderById(Guid id)
        {
            var order = await _serviceManger.orderService.GetOrderById(id);
            return Ok(order);
        }

    }
}
