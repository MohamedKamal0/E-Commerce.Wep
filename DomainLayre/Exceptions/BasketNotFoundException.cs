using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayre.Exceptions
{
    public class BasketNotFoundException(string id):NotFoundException($"Basket With id {id}  Is not Found")
    {
    }
}
