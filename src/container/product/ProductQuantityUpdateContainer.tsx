import {Box, Paper, Typography, useTheme} from "@mui/material";
import {WarehouseOutlined} from "@mui/icons-material";
import {useState} from "react";
import {Course} from "../../api/sagra/sagraSchemas.ts";
import CoursesSelector from "../course/CoursesSelector.tsx";
import ProductsQuantityUpdateList from "./ProductsQuantityUpdateList.tsx";

const ProductQuantityUpdateContainer = () => {
    const theme = useTheme();
    const [course, setCourse] = useState<Course | undefined>(undefined);

    const handleSelectCourse = (course?: Course) => {
        setCourse(course);
    };

    return (
        <>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', mb: 1, alignItems: "center"}}>
                <WarehouseOutlined/>
                <Typography sx={{fontWeight: 700, fontSize: "1.5em"}}>
                    Giacenze Magazzino
                </Typography>
            </Box>

            <Paper variant="outlined"
                   sx={{p: 2, mt: 1, mb: 1, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-top">
                <CoursesSelector handleClick={handleSelectCourse}/>
            </Paper>

            <Paper variant="outlined"
                   sx={{p: 2, mb: 1, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-bottom">
                <ProductsQuantityUpdateList courseId={course?.id} />
            </Paper>
        </>
    );
};

export default ProductQuantityUpdateContainer;