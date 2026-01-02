import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Building2, Calendar, Briefcase, Phone, MapPin } from "lucide-react";

interface HRAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: any;
}

export function HRAccountModal({ isOpen, onClose, account }: HRAccountModalProps) {
    if (!account) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{account.name || account.fullName}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4" />
                        {account.company || account.orgName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant="outline" className={
                            account.status === 'Active' || account.isActive
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }>
                            {account.status || (account.isActive ? "Active" : "Inactive")}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div>
                        <h3 className="font-semibold mb-3">Contact Information</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{account.email}</span>
                            </div>
                            {account.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{account.phone}</span>
                                </div>
                            )}
                            {account.address && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{account.address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Account Details */}
                    <div>
                        <h3 className="font-semibold mb-3">Account Details</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Created On:</span>
                                <p className="font-medium flex items-center gap-1 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    {account.createdAt || "N/A"}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Jobs Posted:</span>
                                <p className="font-medium flex items-center gap-1 mt-1">
                                    <Briefcase className="h-4 w-4" />
                                    {account.jobsPosted || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
