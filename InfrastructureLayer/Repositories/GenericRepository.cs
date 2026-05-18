using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DomainLayre.Contracts;
using DomainLayre.Models;
using InfrastructureLayer.Data;
using Microsoft.EntityFrameworkCore;

namespace InfrastructureLayer.Repositories
{
    public class GenericRepository<T, TKey>(AppDbContext _dbContext) : IGenericRepository<T, TKey> where T : BaseEntity<TKey>
    {
        public async Task AddAsync(T entity)
        {
         await _dbContext.Set<T>().AddAsync(entity);
        }

        public void Delete(T entity)
        {
            _dbContext.Set<T>().Remove(entity);
        }

        public async Task<IEnumerable<T>>GetAllAsync()
        {
           return await _dbContext.Set<T>().ToListAsync();
        }

        public async Task<T?> GetByIdAsync(TKey id)
        {
         return   await _dbContext.Set<T>().FindAsync(id);
        }

        public void Update(T entity)
        {
            _dbContext.Set<T>().Update(entity);
        }
    }
}
