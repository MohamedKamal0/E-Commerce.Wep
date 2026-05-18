using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayre.Models
{
    public class Product_Type:BaseEntity<int>
    {
        public string Name { get; set; } = default!;
    }
}
