import { FC, memo, PropsWithChildren, ReactNode } from "react";
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area";
import { OperationDetail, useClientOperations } from "../jotai/client-operations-atom"
import { Badge } from "@/components/ui/badge";
import { match, P } from "ts-pattern";
import { AwaitingConfirm, AwaitingWithBuffer, Synchronized } from "operational-transformation";

export const DetailPanel: FC = memo(() => {
    const changes = useClientOperations();
    console.log(changes);
    return (
        <Card className="w-[300px] overflow-hidden">
            <div className="flex overflow-hidden flex-col h-full">
                <List title="Client State" >
                    {changes.map((change) => (
                        <ListItem key={change.revision} data={change} />
                    ))}
                </List>
                <div className="border-b" />
                <List title="Server State" />
            </div>
        </Card>
    )
});

interface ListProps {
    title: string;
}

const List: FC<PropsWithChildren<ListProps>> = (props) => {
    const { title, children } = props;
    return (
        <div className="flex flex-col flex-1">
            <h1 className="font-bold py-3 px-4">{title}</h1>
            <div className="flex-1 relative">
                <div className="flex-1 absolute top-0 left-0 bottom-0 right-0">
                    <ScrollArea className="h-full">
                        <div className="px-2 space-y-2">
                            {children}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}

interface ListItemProps {
    data: OperationDetail;
}

const ListItem: FC<ListItemProps> = (props) => {
    const { data } = props;
    return (
        <div className="p-2 border rounded-sm space-y-2">
            <div className="flex justify-between">
                <Badge>{data.action}</Badge>
                <span className="text-sm text-gray-600">revision: {data.revision}</span>
            </div>
            {match(data.state)
                .returnType<ReactNode>()
                .with(P.instanceOf(Synchronized), () => <Badge className="bg-green-500 hover:bg-green-400">Synchronized</Badge>)
                .with(P.instanceOf(AwaitingConfirm), () => <Badge className="bg-blue-500 hover:bg-blue-400">AwaitingConfirm</Badge>)
                .with(P.instanceOf(AwaitingWithBuffer), () => <Badge className="bg-orange-500 hover:bg-orange-400">AwaitingWithBuffer</Badge> )
                .otherwise(() => 'unknown')}
        </div>
    )
}
