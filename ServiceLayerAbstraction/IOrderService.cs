using SheredLayer.DTOs;

namespace ServiceLayerAbstraction
{
    public interface IOrderService
    {
        Task<OrderToReturn> CreateOrder(OrderDto order, string Email);
        Task<IEnumerable<DeliveryMethodDto>> GetDeliveryMethod();
        Task<IEnumerable<OrderToReturn>> GetAllOrders(string Email);
        Task<OrderToReturn> GetOrderById(Guid id);

    }
}
