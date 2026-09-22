using System.Linq.Expressions;
using DomainLayre.Contracts;

namespace ServiceLayer.Specifications
{
    abstract class BaseSpecification<TEntity> : ISpecification<TEntity> where TEntity : class
    {
        //انا بعمل الموضوع ده كلو ليه علشان لما احي في المثود بتات جت اول اعرف اضيف جوها الي انا عيزو من ااسبرشن ذي السرش والسورت 
        protected BaseSpecification(Expression<Func<TEntity, bool>>? criteria)
        {
            Criteria = criteria;
        }
        public Expression<Func<TEntity, bool>>? Criteria { get; private set; }

        public List<Expression<Func<TEntity, object>>> Includexpressions { get; } = [];

        protected void AddInclude(Expression<Func<TEntity, object>> includeExpression)
        {
            Includexpressions.Add(includeExpression);
        }

        public Expression<Func<TEntity, object>> OrderBy { get; private set; }
        public Expression<Func<TEntity, object>> OrderByDescending { get; private set; }
        public List<Expression<Func<TEntity, object>>> ThenByExpressions { get; } = [];
        public List<Expression<Func<TEntity, object>>> ThenByDescendingExpressions { get; } = [];
        protected void AddOrderBy(Expression<Func<TEntity, object>> orderByexp) => OrderBy = orderByexp;
        protected void AddOrderByDescending(Expression<Func<TEntity, object>> OrderByDescendingexp) => OrderByDescending = OrderByDescendingexp;
        protected void AddThenBy(Expression<Func<TEntity, object>> thenBy) => ThenByExpressions.Add(thenBy);
        protected void AddThenByDescending(Expression<Func<TEntity, object>> thenByDescending) => ThenByDescendingExpressions.Add(thenByDescending);


        public int Take { get; private set; }

        public int Skip { get; private set; }

        public bool IsPaginated { get; set; }
        protected void ApplyPagination(int PageSize, int PageIndex)
        {
            IsPaginated = true;
            Take = PageSize;
            Skip = (PageIndex - 1) * PageSize;
        }


    }
}

