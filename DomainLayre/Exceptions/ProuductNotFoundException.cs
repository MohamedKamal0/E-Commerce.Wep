namespace DomainLayre.Exceptions
{
    public sealed class ProuductNotFoundException(int id) : NotFoundException($"Product With id {id}is Not Found")
    {

    }
}
