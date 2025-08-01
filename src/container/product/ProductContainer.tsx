import {Box, Paper, Typography, useTheme} from "@mui/material";
import {RestaurantOutlined} from "@mui/icons-material";
import {useState} from "react";
import ProductEdit from "./ProductEdit.tsx";
import {Course, Product} from "../../api/sagra/sagraSchemas.ts";
import ProductsList from "./ProductsList.tsx";
import CoursesSelector from "../course/CoursesSelector.tsx";

const ProductContainer = () => {
    const theme = useTheme();

    const [selected, setSelected] = useState<Product | undefined>(undefined);
    const [course, setCourse] = useState<Course | undefined>(undefined);

    const selectProduct = (product: Product | undefined) => {
        setSelected(product);
    };

    const handleSelectCourse = (course?: Course) => {
        setCourse(course);
    };

    return (
        <>
            <Box sx={{display: 'flex', justifyContent: 'flex-start', mb: 1, alignItems: "center"}}>
                <RestaurantOutlined/>
                <Typography sx={{fontWeight: 700, fontSize: "1.5em"}}>
                    Prodotti
                </Typography>
            </Box>

            <Paper variant="outlined" sx={{padding: 2, mb: 1, backgroundColor: theme.sagra.panelBackground}}>
                <ProductEdit
                    key={selected?.id}
                    selected={selected}
                    setSelected={selectProduct}
                />
            </Paper>
            <Paper variant="outlined" sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-top">
                <CoursesSelector handleClick={handleSelectCourse}/>
            </Paper>

            <Paper variant="outlined" sx={{padding: 2, backgroundColor: theme.sagra.panelBackground}}
                   className="paper-bottom">
                <ProductsList
                    selected={selected}
                    setSelected={selectProduct}
                    courseId={course?.id}
                />
            </Paper>
        </>
    );
};

export default ProductContainer;