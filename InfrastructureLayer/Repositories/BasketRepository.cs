using DomainLayre.Contracts;
using DomainLayre.Models;
using Microsoft.Extensions.Caching.Distributed;
using SheredLayer;

namespace InfrastructureLayer.Repositories
{
    public class BasketRepository(IDistributedCache cache) : IBasketRepository
    {
        public async Task<CustomerBasket?> CreateOrUpdateBasket(CustomerBasket basket, TimeSpan? timeTolive = null)
        {
            var options = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(timeTolive ?? TimeSpan.FromDays(30));

            await cache.SetAsync(basket.Id, basket, options);

            return await GetBasketAsync(basket.Id);
        }

        public async Task<bool> DeleteBasketAsync(string id)
        {
            var existing = await cache.GetAsync(id);
            if (existing is null)
                return false;

            await cache.RemoveAsync(id);
            return true;
        }

        public async Task<CustomerBasket?> GetBasketAsync(string key)
        {
            var found = cache.TryGetValue(key, out CustomerBasket? basket);
            return found ? basket : null;
        }
    }
}

