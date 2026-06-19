using DomainLayre.Models.OrderModule;

namespace ServiceLayer.Specifications
{
    class OrderSpecification : BaseSpecification<Order>
    {
        //Get All Spcification
        public OrderSpecification(string Email) : base(o => o.UserEmail == Email)
        {
            //نفجشنل بربرتي علشان ميظهروش ب null 
            AddInclude(x => x.DeliveryMethod);
            AddInclude(x => x.Items);
            AddOrderByDescending(x => x.OrderDate);
        }

        //Get By Id Specification
        public OrderSpecification(Guid Id) : base(o => o.Id == Id)
        {
            AddInclude(x => x.DeliveryMethod);
            AddInclude(x => x.Items);
        }
    }
}
