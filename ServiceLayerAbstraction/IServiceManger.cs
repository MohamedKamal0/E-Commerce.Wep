namespace ServiceLayerAbstraction
{
    public interface IServiceManger
    {
        public IProductService productService { get; }
        public IBasketService basketService { get; }
        public IOrderService orderService { get; }
    }
}
