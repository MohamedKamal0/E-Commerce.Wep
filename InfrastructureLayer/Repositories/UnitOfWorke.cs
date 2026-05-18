using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DomainLayre.Contracts;
using DomainLayre.Models;
using InfrastructureLayer.Data;

namespace InfrastructureLayer.Repositories
{
    public class UnitOfWorke(AppDbContext _dbContext) : IUnitOfWorke
    {
        private readonly Dictionary<string, object> _repositories = [];
        public IGenericRepository<T, TKey> GetRepository<T, TKey>() where T : BaseEntity<TKey>//T like User, TKey like int
        {

            var type = typeof(T).Name;
            if (_repositories.TryGetValue(type,out object? value))
            return (IGenericRepository<T, TKey>)value;
            else
                {
                var repository = new GenericRepository<T, TKey>(_dbContext);
                _repositories[type] = repository;
                return repository;
            }
        }

        public async Task<int> SaveChangesAsync()
        {
          return await _dbContext.SaveChangesAsync();
        }
    }
}
