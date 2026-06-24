using AutoMapper;
using DomainLayre.Contracts;
using DomainLayre.Exceptions;
using DomainLayre.Models.OrderModule;
using Microsoft.Extensions.Configuration;
using ServiceLayerAbstraction;
using SheredLayer.DTOs;
using Stripe;
using Product = DomainLayre.Models.Product;
namespace ServiceLayer
{
    public class PaymentService(IConfiguration _configuration,
        IBasketRepository _basketRepository, IUnitOfWorke _unitOfWorke, IMapper _mapper) : IPaymentService
    {
        public async Task<BasketDto> CreateOrUpdatePayment(string BasketId)
        {
            //configure stripe nstallation stripe.net
            StripeConfiguration.ApiKey = _configuration["stripestting:SecretKey"];
            //Get Basket By Id
            var Basket = await _basketRepository.GetBasketAsync(BasketId)
                ?? throw new BasketNotFoundException(BasketId);
            //Get amount - Get Pruduct +Delivery Method cost
            var ProductRepo = _unitOfWorke.GetRepository<Product, int>();
            foreach (var item in Basket.Items)
            {
                var product = await ProductRepo.GetByIdAsync(item.Id)
                    ?? throw new ProuductNotFoundException(item.Id);
                item.Price = product.Price;
            }
            ArgumentNullException.ThrowIfNull(Basket.deliveryMethodId);
            var DeliveryMethod = await _unitOfWorke.GetRepository<DeliveryMethod, int>()
                .GetByIdAsync(Basket.deliveryMethodId.Value)
                ?? throw new DeliveryMethodNotFoundException(Basket.deliveryMethodId.Value);
            Basket.shippingPrice = DeliveryMethod.Price;

            var BasketAmount = (long)(Basket.Items.Sum(item => item.Quantity * item.Price) + DeliveryMethod.Price) * 100;
            //Create Payment intent [create - update]
            var paymentService = new PaymentIntentService();
            if (Basket.paymentIntentId is null)//create
            {
                var options = new PaymentIntentCreateOptions()
                {
                    Amount = BasketAmount,
                    Currency = "USD",
                    PaymentMethodTypes = ["card"]
                };
                var paymentIntent = await paymentService.CreateAsync(options);
                Basket.paymentIntentId = paymentIntent.Id;
                Basket.clientSecret = paymentIntent.ClientSecret;
            }
            else//Update
            {
                var options = new PaymentIntentUpdateOptions() { Amount = BasketAmount };
                await paymentService.UpdateAsync(Basket.paymentIntentId, options);
            }
            await _basketRepository.CreateOrUpdateBasket(Basket);
            return _mapper.Map<BasketDto>(Basket);
        }
    }
}
