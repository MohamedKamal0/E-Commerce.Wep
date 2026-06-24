using DomainLayre.Models.OrderModule;

namespace ServiceLayer.Specifications
{
    class OrderWihPaymIntentenSpecification : BaseSpecification<Order>
    {
        public OrderWihPaymIntentenSpecification(string paymentIntentId) : base(o => o.PaymentIntentId == paymentIntentId)
        {

        }
    }
}
