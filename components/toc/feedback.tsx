import Link from 'next/link'
import { LuArrowUpRight } from 'react-icons/lu'
import { cn } from '@/lib/utils'

interface SideBarEdit {
  title: string
}

export default function RightSideBar({ title }: SideBarEdit) {
  const feedbackUrl = `https://github.com/diaz3618/argus-mcp-catalog/issues/new?title=Feedback for "${title}"&labels=feedback`

  return (
    <div className="flex flex-col gap-3 pl-2">
      <h3 className="text-sm font-semibold">Content</h3>
      <div className="flex flex-col gap-2">
        <Link
          href={feedbackUrl}
          title="Give Feedback"
          aria-label="Give Feedback"
          target="_blank"
          rel="noopener noreferrer"
          className={cn('flex items-center text-sm text-foreground')}
        >
          <LuArrowUpRight className="mr-1 inline-block h-4 w-4" />
          <span>Feedback</span>
        </Link>
      </div>
    </div>
  )
}
