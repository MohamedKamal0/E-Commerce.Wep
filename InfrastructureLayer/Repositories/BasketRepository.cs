using System.Text.Json;
using DomainLayre.Contracts;
using DomainLayre.Models;
using StackExchange.Redis;

namespace InfrastructureLayer.Repositories
{
    public class BasketRepository(IConnectionMultiplexer connection) : IBasketRepository
    {
        private readonly IDatabase _database = connection.GetDatabase();

        public async Task<CustomerBasket?> CreateOrUpdateBasket(CustomerBasket basket, TimeSpan? timeTolive = null)
        {
            var JsonBasket = JsonSerializer.Serialize(basket);
            var IsCreatedOrUpdated = await _database.StringSetAsync(basket.Id, JsonBasket, timeTolive ?? TimeSpan.FromDays(30));
            if (!IsCreatedOrUpdated)
                return null;
            else
                return await GetBasketAsync(basket.Id);
        }

        public async Task<bool> DeleteBasketAsync(string id)
        {
            return await _database.KeyDeleteAsync(id);
        }

        public async Task<CustomerBasket?> GetBasketAsync(string key)
        {

            var Basket = await _database.StringGetAsync(key);
            if (Basket.IsNullOrEmpty)
                return null;
            else
                return JsonSerializer.Deserialize<CustomerBasket>(Basket!);
        }
    }
}
