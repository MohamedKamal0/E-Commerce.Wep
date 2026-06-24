using AutoMapper;
using DomainLayre.Contracts;
using Microsoft.Extensions.Configuration;
using ServiceLayerAbstraction;

namespace ServiceLayer
{
    public class ServiceManger(IUnitOfWorke _unitOfWorke, IMapper _mapper, IBasketRepository basketRepository, IConfiguration _configuration) : IServiceManger
    {
        private readonly Lazy<IProductService> _LazyProductService =
            new Lazy<IProductService>(() => new ProductService(_unitOfWorke, _mapper));
        public IProductService productService => _LazyProductService.Value;


        private readonly Lazy<IBasketService> _LazyBasketService =
            new Lazy<IBasketService>(() => new BasketService(basketRepository, _mapper));
        public IBasketService basketService => _LazyBasketService.Value;

        private readonly Lazy<IOrderService> _LazyOrderService =
            new Lazy<IOrderService>(() => new OrderService(_mapper, basketRepository, _unitOfWorke));
        public IOrderService orderService => _LazyOrderService.Value;

        private readonly Lazy<IPaymentService> _LazypaymentService = new Lazy<IPaymentService>(() => new PaymentService
        (_configuration, basketRepository, _unitOfWorke, _mapper));
        public IPaymentService paymentService => _LazypaymentService.Value;
    }
}
