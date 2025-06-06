import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    TextField,
    Tooltip,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Add, Edit } from '@material-ui/icons';
import { forwardRef, useCallback, useState, useMemo } from 'react';

import { addSchedule, renameSchedule } from '$actions/AppStoreActions';
import { useThemeStore } from '$stores/SettingsStore';

const styles = () => ({
    addButton: {
        marginRight: '5px',
    },
    textField: {
        marginBottom: '25px',
    },
});

interface ScheduleNameDialogProps {
    classes: ClassNameMap;
    onOpen?: () => void;
    onClose?: () => void;
    scheduleNames: string[];
    scheduleRenameIndex?: number;
}

const ScheduleNameDialog = forwardRef((props: ScheduleNameDialogProps, ref) => {
    const isDark = useThemeStore((store) => store.isDark);

    const { classes, onOpen, onClose, scheduleNames, scheduleRenameIndex } = props;

    const [isOpen, setIsOpen] = useState(false);

    const [scheduleName, setScheduleName] = useState(
        scheduleRenameIndex !== undefined ? scheduleNames[scheduleRenameIndex] : `Schedule ${scheduleNames.length + 1}`
    );

    const rename = useMemo(() => scheduleRenameIndex !== undefined, [scheduleRenameIndex]);

    // We need to stop propagation so that the select menu won't close
    const handleOpen = useCallback(
        (event: React.MouseEvent) => {
            event.stopPropagation();
            setIsOpen(true);
            onOpen?.();
        },
        [onOpen]
    );

    /**
     * If the user cancelled renaming the schedule, the schedule name is changed to its original value.
     * If the user cancelled adding a new schedule, the schedule name is changed to the default schedule name.
     */
    const handleCancel = useCallback(() => {
        setIsOpen(false);

        if (scheduleRenameIndex != null) {
            setScheduleName(rename ? scheduleNames[scheduleRenameIndex] : `Schedule ${scheduleNames.length + 1}`);
        }
    }, [rename, scheduleNames, scheduleRenameIndex]);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScheduleName(event.target.value);
    }, []);

    const submitName = useCallback(() => {
        onClose?.();

        if (rename) {
            renameSchedule(scheduleRenameIndex as number, scheduleName); // typecast works b/c this function only runs when `const rename = scheduleRenameIndex !== undefined` is true.
        } else {
            addSchedule(scheduleName);
        }

        setIsOpen(false);
    }, [onClose, rename, scheduleName, scheduleRenameIndex]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            event.stopPropagation();

            if (event.key === 'Enter') {
                submitName();
            }

            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        },
        [submitName]
    );

    // For the dialog, we need to stop the propagation when a key is pressed because
    // MUI Select components support "select by typing", which can remove focus from the dialog.
    // We also need to stop the propagation when the dialog is clicked because if we don't,
    // both the select menu and dialog will close.
    return (
        <>
            {rename ? (
                <MenuItem onClick={handleOpen}>
                    <Tooltip title="Rename Schedule">
                        <IconButton size="small">
                            <Edit />
                        </IconButton>
                    </Tooltip>
                </MenuItem>
            ) : (
                <MenuItem onClick={handleOpen}>
                    <Add className={classes.addButton} />
                    Add Schedule
                </MenuItem>
            )}
            <Dialog
                ref={ref}
                fullWidth
                open={isOpen}
                onKeyDown={handleKeyDown}
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
                onClose={() => setIsOpen(false)}
            >
                <DialogTitle>{rename ? 'Rename Schedule' : 'Add a New Schedule'}</DialogTitle>

                <DialogContent>
                    <TextField
                        // We enable autofocus in order to be consistent with the Save, Load, and Import dialogs
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        fullWidth
                        className={classes.textField}
                        label="Name"
                        placeholder={`Schedule ${scheduleNames.length + 1}`}
                        onChange={handleNameChange}
                        value={scheduleName}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCancel} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button
                        onClick={submitName}
                        variant="contained"
                        color="primary"
                        disabled={scheduleName.trim() === ''}
                    >
                        {rename ? 'Rename Schedule' : 'Add Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

ScheduleNameDialog.displayName = 'ScheduleNameDialog';

export default withStyles(styles)(ScheduleNameDialog);
