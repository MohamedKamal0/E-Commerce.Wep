using System.Linq.Expressions;

namespace DomainLayre.Contracts
{
    public interface ISpecification<TEntity> where TEntity : class
    {
        public Expression<Func<TEntity, bool>>? Criteria { get; }
        List<Expression<Func<TEntity, object>>> Includexpressions { get; }
        Expression<Func<TEntity, object>> OrderBy { get; }
        Expression<Func<TEntity, object>> OrderByDescending { get; }
        List<Expression<Func<TEntity, object>>> ThenByExpressions { get; }
        List<Expression<Func<TEntity, object>>> ThenByDescendingExpressions { get; }
        public int Take { get; }
        public int Skip { get; }
        public bool IsPaginated { get; set; }
    }
}
