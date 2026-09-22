using DomainLayre.Contracts;
using Microsoft.EntityFrameworkCore;

namespace InfrastructureLayer.Repositories
{
    static class SpecificationEvaluator
    {
        //-dbcontext.product.Where(s => s.id).Include(s => s.PrandID)ده شرحها الي تحت احنا كده بنعمل ده كله علشان نخليه اي كوربل
        //وتستدعي من الداتابيز
        //_dbcontext.product.Where(specification.Criteria).Include(specification.Includexpressions)
        //create a method that takes in an IQueryable and
        //a specification and returns an IQueryable that applies the specification's criteria and includes
        //specification is int

        public static IQueryable<TEntity> CreateQuery<TEntity>(IQueryable<TEntity> inputQuery, ISpecification<TEntity> specification) where TEntity : class
        {
            var query = inputQuery;
            if (specification.Criteria != null)
            {
                query = query.Where(specification.Criteria);
            }
            if (specification.OrderBy is not null)
            {
                var ordered = query.OrderBy(specification.OrderBy);
                foreach (var thenBy in specification.ThenByExpressions)
                    ordered = ordered.ThenBy(thenBy);
                foreach (var thenByDesc in specification.ThenByDescendingExpressions)
                    ordered = ordered.ThenByDescending(thenByDesc);
                query = ordered;
            }
            else if (specification.OrderByDescending is not null)
            {
                var ordered = query.OrderByDescending(specification.OrderByDescending);
                foreach (var thenByDesc in specification.ThenByDescendingExpressions)
                    ordered = ordered.ThenByDescending(thenByDesc);
                foreach (var thenBy in specification.ThenByExpressions)
                    ordered = ordered.ThenBy(thenBy);
                query = ordered;
            }
            if (specification.Includexpressions != null && specification.Includexpressions.Count > 0)
            {
                query = specification.Includexpressions.Aggregate(query, (current, include) => current.Include(include));
            }
            if (specification.IsPaginated)
            {
                query = query.Skip(specification.Skip).Take(specification.Take);
            }

            return query;
        }
    }
}
