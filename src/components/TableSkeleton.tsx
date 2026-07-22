import { LineSkeleton } from "./Skeleton";

export default function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
    return (
        <div className="card overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-line">
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="px-4 py-3">
                                <LineSkeleton width="60%" height={10} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, r) => (
                        <tr key={r} className="border-b border-line/50">
                            {Array.from({ length: cols }).map((_, c) => (
                                <td key={c} className="px-4 py-3">
                                    <LineSkeleton width={`${40 + Math.random() * 50}%`} height={10} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

