using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayre.Models
{
   public class BaseEntity<TKay>
    {
        public TKay Id { get; set; }
    }
}
