using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfrastructureLayer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductColorAndCreatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Products",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Products",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.Sql(@"
UPDATE Products SET Color = 'black'
WHERE Color IS NULL AND (
    LOWER(Name) LIKE '%black%' OR LOWER(Name) LIKE '%charcoal%' OR LOWER(Name) LIKE '%onyx%'
    OR LOWER(Description) LIKE '%black%' OR LOWER(Description) LIKE '%charcoal%');

UPDATE Products SET Color = 'yellow'
WHERE Color IS NULL AND (
    LOWER(Name) LIKE '%yellow%' OR LOWER(Name) LIKE '%lemon%' OR LOWER(Name) LIKE '%mustard%'
    OR LOWER(Description) LIKE '%yellow%' OR LOWER(Description) LIKE '%lemon%');

UPDATE Products SET Color = 'blue'
WHERE Color IS NULL AND (
    LOWER(Name) LIKE '%blue%' OR LOWER(Name) LIKE '%navy%' OR LOWER(Name) LIKE '%ocean%'
    OR LOWER(Name) LIKE '%sky%' OR LOWER(Name) LIKE '%indigo%'
    OR LOWER(Description) LIKE '%blue%' OR LOWER(Description) LIKE '%navy%' OR LOWER(Description) LIKE '%ocean%');

UPDATE Products SET Color = 'teal'
WHERE Color IS NULL AND (
    LOWER(Name) LIKE '%teal%' OR LOWER(Name) LIKE '%turquoise%' OR LOWER(Name) LIKE '%aqua%'
    OR LOWER(Description) LIKE '%teal%' OR LOWER(Description) LIKE '%turquoise%');

UPDATE Products SET Color = 'sage'
WHERE Color IS NULL AND (
    LOWER(Name) LIKE '%sage%' OR LOWER(Name) LIKE '%green%' OR LOWER(Name) LIKE '%olive%' OR LOWER(Name) LIKE '%mint%'
    OR LOWER(Description) LIKE '%sage%' OR LOWER(Description) LIKE '%green%' OR LOWER(Description) LIKE '%olive%');

UPDATE Products SET Color = 'pink'
WHERE Color IS NULL AND (
    LOWER(Name) LIKE '%pink%' OR LOWER(Name) LIKE '%blush%' OR LOWER(Name) LIKE '%rose%'
    OR LOWER(Name) LIKE '%lavender%' OR LOWER(Name) LIKE '%peach%' OR LOWER(Name) LIKE '%coral%'
    OR LOWER(Description) LIKE '%pink%' OR LOWER(Description) LIKE '%blush%' OR LOWER(Description) LIKE '%rose%'
    OR LOWER(Description) LIKE '%lavender%' OR LOWER(Description) LIKE '%peach%');

UPDATE Products SET Color = 'cream'
WHERE Color IS NULL AND (
    LOWER(Name) LIKE '%cream%' OR LOWER(Name) LIKE '%ivory%' OR LOWER(Name) LIKE '%beige%'
    OR LOWER(Name) LIKE '%linen%' OR LOWER(Name) LIKE '%white%' OR LOWER(Name) LIKE '%natural%'
    OR LOWER(Description) LIKE '%cream%' OR LOWER(Description) LIKE '%ivory%' OR LOWER(Description) LIKE '%beige%'
    OR LOWER(Description) LIKE '%linen%' OR LOWER(Description) LIKE '%white%');
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Color", table: "Products");
            migrationBuilder.DropColumn(name: "CreatedAt", table: "Products");
        }
    }
}
