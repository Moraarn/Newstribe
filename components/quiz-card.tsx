"use client"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Award, HelpCircle, Star } from "lucide-react"
import { IContent } from "@/types/content";

interface QuizCardProps {
  content: IContent;
}

export function QuizCard({ content }: QuizCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Link href={`/content/${content._id}`}>
          <Image
            src={content.imageUrl || "/placeholder.svg"}
            alt={content.title}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
        </Link>
        {content.isSponsored && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Sponsored by {content?.sponsor?.name}
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-0">
        <div>
          <p className="text-sm text-muted-foreground">{content.category}</p>
          <Link href={`/content/${content._id}`} className="hover:underline">
            <h3 className="font-bold mt-1 line-clamp-2">{content.title}</h3>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{content.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          <span>{content.quiz?.questions?.length} questions</span>
        </div>
        <div className="flex items-center gap-2">
            {content.isSponsored && content.points && (
              <Badge variant="outline" className="bg-primary/10">
                <Award className="h-3 w-3 mr-1 text-primary" />
                {content.points} points
              </Badge>
            )}
          <Badge variant="outline">
            <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
            {content.points} pts
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
}
