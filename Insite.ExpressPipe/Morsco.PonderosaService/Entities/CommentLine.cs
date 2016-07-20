using Ponderosa.U2mv.Results;

namespace Morsco.PonderosaService.Entities
{
    public class CommentLine : OrderDetailBase
    {
        public CommentLine(RowResult items)
            : base(items, Constants.ItemCode.Comment)
        {
        }

        public CommentLine() : base()
        {
            ItemCode = Constants.ItemCode.Comment;
        }
    }
}