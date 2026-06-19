using DomainLayre.Models;

namespace DomainLayre.Contracts
{
    public interface IBasketRepository
    {
        Task<CustomerBasket?> GetBasketAsync(string key);
        Task<CustomerBasket?> CreateOrUpdateBasket(CustomerBasket basket, TimeSpan? timeTolive = null);
        Task<bool> DeleteBasketAsync(string id);
    }
}
