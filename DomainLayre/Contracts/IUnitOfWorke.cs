using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DomainLayre.Models;

namespace DomainLayre.Contracts
{
    public interface IUnitOfWorke
    {
        IGenericRepository<T, TKey> GetRepository<T, TKey>() where T : BaseEntity<TKey>;
        Task<int> SaveChangesAsync();


    }
}
