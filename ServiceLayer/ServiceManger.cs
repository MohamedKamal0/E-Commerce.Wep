using AutoMapper;
using DomainLayre.Contracts;
using ServiceLayerAbstraction;

namespace ServiceLayer
{
    public class ServiceManger(IUnitOfWorke _unitOfWorke, IMapper _mapper, IBasketRepository basketRepository) : IServiceManger
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
    }
}
