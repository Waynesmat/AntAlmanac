import { Button, Popover, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import GradesPopup from '$components/RightPane/SectionTable/GradesPopup';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { Grades } from '$lib/grades';
import { MOBILE_BREAKPOINT } from '$src/globals';
import { usePrimaryColor } from '$src/hooks/usePrimaryColor';

async function getGpaData(deptCode: string, courseNumber: string, instructors: string[]) {
    const namedInstructors = instructors.filter((instructor) => instructor !== 'STAFF');

    // Get the GPA of the first instructor of this section where data exists
    for (const instructor of namedInstructors) {
        const grades = await Grades.queryGrades(deptCode, courseNumber, instructor, false);
        if (grades?.averageGPA) {
            return {
                gpa: grades.averageGPA.toFixed(2).toString(),
                instructor: instructor,
            };
        }
    }

    return undefined;
}

interface GpaCellProps {
    deptCode: string;
    courseNumber: string;
    instructors: string[];
}

export const GpaCell = ({ deptCode, courseNumber, instructors }: GpaCellProps) => {
    const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    const [gpa, setGpa] = useState('');
    const [instructor, setInstructor] = useState('');
    const [anchorEl, setAnchorEl] = useState<Element>();
    const primaryColor = usePrimaryColor();

    const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl((currentAnchorEl) => (currentAnchorEl ? undefined : event.currentTarget));
    }, []);

    const hideDistribution = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    useEffect(() => {
        getGpaData(deptCode, courseNumber, instructors)
            .then((data) => {
                if (data) {
                    setGpa(data.gpa);
                    setInstructor(data.instructor);
                }
            })
            .catch(console.log);
    }, [deptCode, courseNumber, instructors]);

    return (
        <TableBodyCellContainer>
            <Button
                sx={{
                    paddingX: 0,
                    paddingY: 0,
                    minWidth: 0,
                    fontWeight: 400,
                    fontSize: '1rem',
                    color: primaryColor,
                }}
                onClick={handleClick}
                variant="text"
            >
                {gpa}
            </Button>
            <Popover
                open={Boolean(anchorEl)}
                onClose={hideDistribution}
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <GradesPopup
                    deptCode={deptCode}
                    courseNumber={courseNumber}
                    instructor={instructor}
                    isMobileScreen={isMobile}
                />
            </Popover>
        </TableBodyCellContainer>
    );
};
