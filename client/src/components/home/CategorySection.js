import React, { useEffect, useState } from "react";
import { Grid, Typography, Divider, Button } from "@mui/material";
import ItemCard from "../menu-item/ItemCard";

const RECORDS_PER_PAGE = 4;

const CategorySection = (props) => {
    const { items, category, handleOpenDeleteDialog } = props;

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const handlePageChange = (toPage) => {
        if (toPage === currentPage) {
            return;
        }
        setCurrentPage(toPage);
    };

    useEffect(() => {
        setTotalPages(Math.ceil(items.length / RECORDS_PER_PAGE));
    }, [items]);

    return (
        items.length != 0 && (
            <Grid item xs={12} md={12} sm={12} my={2}>
                <Typography
                    fontFamily="Bartender SmCond Serif Pressed"
                    variant="h4"
                    textAlign="center"
                    my={1}
                >
                    {category.name}
                </Typography>
                <Divider sx={{ mx: 2 }} />

                <Grid container>
                    {items
                        .slice(
                            currentPage * RECORDS_PER_PAGE,
                            currentPage * RECORDS_PER_PAGE + RECORDS_PER_PAGE
                        )
                        .map((menuItem) => (
                            <Grid
                                item
                                xs={12}
                                sm={4}
                                md={3}
                                sx={{ p: 2 }}
                                key={menuItem._id}
                            >
                                <ItemCard menuItem={menuItem} handleOpenDeleteDialog={handleOpenDeleteDialog} />
                            </Grid>
                        ))}
                </Grid>

                <Grid container>
                    <Grid item xs={12} md={12} sm={12} textAlign="center">
                        {[...Array(totalPages).keys()].map((page) => (
                            <Button
                                key={page}
                                variant={
                                    page === currentPage
                                        ? "contained"
                                        : "outlined"
                                }
                                sx={{ mx: 0.5 }}
                                onClick={() => handlePageChange(page)}
                            >
                                {page + 1}
                            </Button>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        )
    );
};

export default CategorySection;
