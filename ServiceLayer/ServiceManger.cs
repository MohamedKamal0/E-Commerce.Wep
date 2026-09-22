using AutoMapper;
using DomainLayre.Contracts;
using DomainLayre.Models.IdentityModeyol;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ServiceLayerAbstraction;

namespace ServiceLayer
{
    public class ServiceManger(IUnitOfWorke _unitOfWorke, IMapper _mapper, IBasketRepository basketRepository,
        IConfiguration _configuration, UserManager<ApplicationUser> _userManager, IDistributedCache _cache, ILogger<ProductService> _logger) : IServiceManger
    {
        private readonly Lazy<IProductService> _LazyProductService =
            new Lazy<IProductService>(() => new ProductService(_unitOfWorke, _mapper, _cache, _logger));
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

        private readonly Lazy<IAuthService> _LazyAuthService = new Lazy<IAuthService>(() => new AuthService(_userManager, _configuration, _mapper));
        public IAuthService authService => _LazyAuthService.Value;
    }
}
