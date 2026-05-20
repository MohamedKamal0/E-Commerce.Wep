using DomainLayre.Models;

namespace DomainLayre.Contracts
{
    public interface IGenericRepository<TEntity, TKey> where TEntity : BaseEntity<TKey>
    {
        Task<TEntity?> GetByIdAsync(TKey id);
        Task<IEnumerable<TEntity>> GetAllAsync();

        //
        Task<TEntity?> GetByIdAsync(ISpecification<TEntity> specifications);
        Task<IEnumerable<TEntity>> GetAllAsync(ISpecification<TEntity> specifications);
        Task<int> CountAsync(ISpecification<TEntity> specifications);
        //

        Task AddAsync(TEntity entity);
        void Update(TEntity entity);
        void Delete(TEntity entity);
    }
}
