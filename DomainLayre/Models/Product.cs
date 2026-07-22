using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DomainLayre.Models
{
    public class Product:BaseEntity<int>
    {
        public string Name { get; set; }=default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public Product_Brand Product_Brand { get; set; } 
        public int BrandId { get; set; } //FK

        public Product_Type Product_Type { get; set; } 
        public int TyepId { get; set; } //FK

        public ICollection<ProductImage> Images { get; set; } = [];
    }
}
