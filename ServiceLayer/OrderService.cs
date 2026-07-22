using AutoMapper;
using DomainLayre.Contracts;
using DomainLayre;
using DomainLayre.Exceptions;
using DomainLayre.Models;
using DomainLayre.Models.OrderModule;
using ServiceLayer.Specifications;
using ServiceLayerAbstraction;
using SheredLayer.DTOs;

namespace ServiceLayer
{
    public class OrderService(IMapper _mapper, IBasketRepository _basketRepository, IUnitOfWorke _unitOfWorke) : IOrderService
    {

        public async Task<OrderToReturn> CreateOrder(OrderDto order, string Email)
        {
            //Map Address To Order
            var OrderAddress = _mapper.Map<AddressDto, OrderAddress>(order.address);
            //Get Basket
            var basket = await _basketRepository.GetBasketAsync(order.BasketId)
                ?? throw new BasketNotFoundException(order.BasketId);
            //for Paymeny
            ArgumentNullException.ThrowIfNullOrEmpty(basket.paymentIntentId);
            var OrderRepo = _unitOfWorke.GetRepository<Order, Guid>();
            var Orderspac = new OrderWihPaymIntentenSpecification(basket.paymentIntentId);
            var ExistingOrder = await OrderRepo.GetByIdAsync(Orderspac);
            if (ExistingOrder != null) OrderRepo.Delete(ExistingOrder);

            //Create orderItem list
            List<OrderItem> OrderItems = [];
            var ProductRepo = _unitOfWorke.GetRepository<Product, int>();
            foreach (var item in basket.Items)
            {
                var productSpec = new ProductWithprandAndTyepSpecification(item.Id);
                var Product = await ProductRepo.GetByIdAsync(productSpec)
                      ?? throw new ProuductNotFoundException(item.Id);
                var orderItem = new OrderItem
                {
                    Product = new ProductItemOrdered()
                    {
                        ProductId = Product.Id,
                        ProductName = Product.Name,
                        PictureUrl = Product.GetPrimaryPictureUrl()
                    },
                    Price = item.Price,
                    Quantity = item.Quantity

                };
                OrderItems.Add(orderItem);
            }
            //Get Delivery Method

            var Deliverymethod = await _unitOfWorke.GetRepository<DeliveryMethod, int>().GetByIdAsync(order.DeliveryMethodId)
                ?? throw new DeliveryMethodNotFoundException(order.DeliveryMethodId);

            var subTotal = OrderItems.Sum(i => i.Price * i.Quantity);
            var Order = new Order(Email, OrderAddress, Deliverymethod, OrderItems, subTotal, basket.paymentIntentId);

            await OrderRepo.AddAsync(Order);
            await _unitOfWorke.SaveChangesAsync();
            return _mapper.Map<Order, OrderToReturn>(Order);
        }

        public async Task<IEnumerable<OrderToReturn>> GetAllOrders(string Email)
        {
            var spec = new OrderSpecification(Email);
            var Orders = await _unitOfWorke.GetRepository<Order, Guid>().GetAllAsync(spec);

            return _mapper.Map<IEnumerable<Order>, IEnumerable<OrderToReturn>>(Orders);
        }

        public async Task<IEnumerable<DeliveryMethodDto>> GetDeliveryMethod()
        {

            var DeliveryMethods = await _unitOfWorke.GetRepository<DeliveryMethod, int>().GetAllAsync();

            return _mapper.Map<IEnumerable<DeliveryMethod>, IEnumerable<DeliveryMethodDto>>(DeliveryMethods);
        }

        public async Task<OrderToReturn> GetOrderById(Guid id)
        {
            var spec = new OrderSpecification(id);
            var Order = await _unitOfWorke.GetRepository<Order, Guid>().GetByIdAsync(spec);

            return _mapper.Map<Order, OrderToReturn>(Order);
        }
    }

}
