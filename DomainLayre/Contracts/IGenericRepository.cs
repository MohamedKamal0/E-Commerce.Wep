using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DomainLayre.Models;

namespace DomainLayre.Contracts
{
    public interface IGenericRepository<T,TKey> where T : BaseEntity<TKey>
    {
        Task<T?> GetByIdAsync(TKey id);
        Task<IEnumerable<T>> GetAllAsync();
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
    }
}
