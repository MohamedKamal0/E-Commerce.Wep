namespace DomainLayre.Exceptions
{
    public sealed class DeliveryMethodNotFoundException(int id) : NotFoundException($"No Delivery method Found With {id} ")
    {
    }
}
