import {Box, Divider, IconButton, InputBase, Paper} from "@mui/material"
import CoursesSelector from "../course/CoursesSelector";
import { Close } from "@mui/icons-material";
import {Course} from "../../api/sagra/sagraSchemas.ts";
import * as React from "react";
import {useState} from "react";
import {ProductsSearchQueryParams} from "../../api/sagra/sagraComponents.ts";
import SearchIcon from "@mui/icons-material/Search";

interface ProductSearchFormProps {
    setSearchParam : (searchParam : ProductsSearchQueryParams) => void
}

const ProductSearchForm : React.FC<ProductSearchFormProps> = (props: ProductSearchFormProps) => {

    const [courseSelected, setCourseSelected] = useState<Course|undefined>(undefined)
    const [name, setName] = useState<string>('')

    const {setSearchParam} = props

    const createSearchParam = ( currentName: string, currentCourse?: Course) => {
        const searchParam = {} as ProductsSearchQueryParams;

        if ( currentName )
            searchParam.name = currentName

        if ( currentCourse )
            searchParam.courseId = currentCourse.id

        console.log("SearchParam Prodotti: ", searchParam)
        return searchParam;
    }

    const handleSelectCourse = (course?: Course) => {
        setCourseSelected(course)
        setSearchParam(createSearchParam(name, course))
    }

    const handleChangeName =
        React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
            setCourseSelected(undefined)
                setName(event.currentTarget.value);
            }, [setName, setCourseSelected]
        );

    const handleResetName =
        React.useCallback<React.MouseEventHandler>((_event) => {
            setCourseSelected(undefined)
            setName('');
            setSearchParam({})
            }, [setName, setCourseSelected, setSearchParam]
        );

    const handleClickSearch = () => {
        setSearchParam(createSearchParam(name, courseSelected))
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if( event.key == 'Enter' ) {
            setSearchParam(createSearchParam(name, courseSelected))
        }
    };

    return (
        <Box>
            <CoursesSelector selected={courseSelected} select={handleSelectCourse}/>

            <Paper
                component="div"
                sx={{  mt: 1, p: '2px 4px', display: 'flex', alignItems: 'center', width: '50%', minWidth: '320px' }}
            >
                <InputBase
                    sx={{ m: 1, flex: 1 }}
                    placeholder="Nome prodotto da ricercare"
                    value={name}
                    onChange={handleChangeName}
                    onKeyUp={handleKeyPress}
                />
                <IconButton sx={{ p: '10px' }} aria-label="menu" onClick={handleResetName}>
                    <Close />
                </IconButton>
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleClickSearch}>
                    <SearchIcon />
                </IconButton>
            </Paper>
        </Box>
    )
}

export default ProductSearchForm