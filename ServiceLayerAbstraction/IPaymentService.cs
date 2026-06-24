using SheredLayer.DTOs;

namespace ServiceLayerAbstraction
{
    public interface IPaymentService
    {
        Task<BasketDto> CreateOrUpdatePayment(string BasketId);
    }
}
