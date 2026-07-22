using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfrastructureLayer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PictureUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductImages_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductId_DisplayOrder",
                table: "ProductImages",
                columns: new[] { "ProductId", "DisplayOrder" });

            migrationBuilder.Sql(@"
INSERT INTO ProductImages (PictureUrl, DisplayOrder, ProductId)
SELECT PictureUrl, 0, Id
FROM Products
WHERE PictureUrl IS NOT NULL AND PictureUrl <> ''");

            migrationBuilder.DropColumn(
                name: "PictureUrl",
                table: "Products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PictureUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
UPDATE p
SET p.PictureUrl = pi.PictureUrl
FROM Products p
INNER JOIN (
    SELECT ProductId, PictureUrl,
           ROW_NUMBER() OVER (PARTITION BY ProductId ORDER BY DisplayOrder) AS rn
    FROM ProductImages
) pi ON p.Id = pi.ProductId AND pi.rn = 1");

            migrationBuilder.DropTable(
                name: "ProductImages");
        }
    }
}
