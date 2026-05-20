using DomainLayre.Contracts;
using DomainLayre.Models;
using InfrastructureLayer.Data;
using Microsoft.EntityFrameworkCore;

namespace InfrastructureLayer.Repositories
{
    public class GenericRepository<TEntity, TKey>(AppDbContext _dbContext) : IGenericRepository<TEntity, TKey> where TEntity : BaseEntity<TKey>
    {
        public async Task AddAsync(TEntity entity)
        {
            await _dbContext.Set<TEntity>().AddAsync(entity);
        }

        public void Delete(TEntity entity)
        {
            _dbContext.Set<TEntity>().Remove(entity);
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _dbContext.Set<TEntity>().ToListAsync();
        }
        public async Task<TEntity?> GetByIdAsync(TKey id)
        {
            return await _dbContext.Set<TEntity>().FindAsync(id);
        }
        public async Task<IEnumerable<TEntity>> GetAllAsync(ISpecification<TEntity> specifications)
        {
            return await SpecificationEvaluator.CreateQuery(_dbContext.Set<TEntity>(), specifications).ToListAsync();
        }
        public async Task<int> CountAsync(ISpecification<TEntity> specifications)
        {
            return await SpecificationEvaluator.CreateQuery(_dbContext.Set<TEntity>(), specifications).CountAsync();
        }
        public async Task<TEntity?> GetByIdAsync(ISpecification<TEntity> specifications)
        {

            return await SpecificationEvaluator.CreateQuery(_dbContext.Set<TEntity>(), specifications).FirstOrDefaultAsync();
        }

        public void Update(TEntity entity)
        {
            _dbContext.Set<TEntity>().Update(entity);
        }


    }
}
